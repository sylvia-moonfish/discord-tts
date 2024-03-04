import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, Events } from "discord.js";
import dotenv from "dotenv";
import { JSONFilePreset } from "lowdb/node";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prism from "prism-media";

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    dotenv.config();

    // if the event is coming from the bot itself,
    // escape to break infinite looping.
    if (oldState.id === process.env.CLIENT_ID) return;

    // find voice channels with active members.
    const guild = oldState.guild;
    const channels = await guild.channels.fetch();
    const activeChannels = channels
      .filter((channel) => channel.type === ChannelType.GuildVoice)
      .filter((channel) => channel.members.size > 0);

    // check if bot has already established voice connection.
    const connection = getVoiceConnection(guild.id);

    // if connection exists and there's no active channel, disconnect.
    if (connection && activeChannels.size === 0) {
      connection.destroy();
    } else {
      // prepare lowdb.
      const db = await JSONFilePreset(".db.json", { users: [] });
      await db.read();

      const targetUser = db.data.users.find((user) => user.target);
      const targetChannel = { id: -1, size: -1 };

      if (targetUser) {
        // if a user is marked as targeted,
        // find the channel where that user is connected to.
        const _channel = activeChannels.filter(
          (channel) =>
            channel.members.filter((member) => member.id === targetUser.id)
              .size > 0
        );

        // if target user is found,
        // mark that channel as the target so that bot can connect to it.
        if (_channel.size > 0) {
          targetChannel.id = _channel.at(0).id;
          targetChannel.size = _channel.at(0).members.size;
        }
      }

      // this means either
      // - there is no targeted user OR
      // - targeted user is not connected to any voice channel.
      if (targetChannel.size === -1) {
        // iterate through all voice channels and count the
        // number of signed up users.
        activeChannels.each((channel) => {
          if (
            channel.members.filter(
              (member) => !!db.data.users.find((user) => user.id === member.id)
            ).size > targetChannel.size
          ) {
            // set the channel with the most number of signed up users
            // as the target channel.
            targetChannel.id = channel.id;
            targetChannel.size = channel.members.size;
          }
        });
      }

      // if suitable target channel was found by above logic...
      if (targetChannel.size > 0) {
        // connect to the target channel!
        const connection = joinVoiceChannel({
          channelId: targetChannel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfDeaf: false,
        });

        // find the target channel info from the list of channels.
        const joinedChannel = activeChannels.find(
          (channel) => channel.id === targetChannel.id
        );

        // find the member information of the target channel.
        const joinedMembers = joinedChannel.members.filter(
          (member) => !!db.data.users.find((user) => user.id === member.id)
        );

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // iterate through all signed up members in the voice channel...
        joinedMembers.each((joinedMember) => {
          // check if a subscription has been made already.
          if (!connection.receiver.subscriptions.has(joinedMember.id)) {
            // file path would be ~/audio/{memberId}/{date}/{number}
            const isoDate = new Date().toISOString();
            const userAudioDir = path.join(
              __dirname,
              "audio",
              joinedMember.id,
              isoDate.substring(0, isoDate.indexOf("T"))
            );

            // create the memberId and date folder if it doesn't exist...
            if (!fs.existsSync(userAudioDir)) {
              fs.mkdirSync(userAudioDir);
            }

            // iterate through the existing audio files to determine the max number...
            // TODO: this is O(n)... maybe there is smarter way to do this?
            const audioFiles = fs.readdirSync(userAudioDir);
            let maxNum = 1;

            for (const audioFile of audioFiles) {
              const fileNum = parseInt(audioFile);

              if (!isNaN(fileNum) && fileNum >= maxNum) {
                maxNum = fileNum + 1;
              }
            }

            // subscribe to the target user's audio stream,
            // then pipe the opus stream through opus decoder,
            // then write it to the file stream.
            connection.receiver
              .subscribe(joinedMember.id)
              .pipe(
                new prism.opus.Decoder({
                  frameSize: 960,
                  channels: 2,
                  rate: 48000,
                })
              )
              .pipe(fs.createWriteStream(path.join(userAudioDir, maxNum)));

            // ffmpeg -f s16le -ar 48k -ac 2 -i out.pcm out.mp3
          }
        });
      }
    }
  },
};
