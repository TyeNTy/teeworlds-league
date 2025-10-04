const { Client, GatewayIntentBits, ChannelType, Events } = require("discord.js");
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN, API_URL } = require("../config");
const enumErrorCode = require("../enums/enumErrorCode");

class DiscordService {
  constructor() {
    this.client = null;
  }

  async init() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    return new Promise((resolve, reject) => {
      this.client.once(Events.ClientReady, async () => {
        try {
          console.log(`Discord bot ready! Logged in as ${this.client.user.tag}`);
          resolve({ ok: true });
        } catch (error) {
          console.error("Failed to fetch guild:", error);
          reject({ ok: false, errorCode: enumErrorCode.SERVER_ERROR });
        }
      });

      this.client.on(Events.Error, (error) => {
        console.error("Discord client error:", error);
      });

      this.client.login(DISCORD_BOT_TOKEN).catch(reject);
    });
  }

  async getBotInviteUrl() {
    const scopes = ["bot", "applications.commands"];
    const permissions = "8"; // Administrator permissions (you can customize this)

    return {
      ok: true,
      data: {
        url: `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=${scopes.join("%20")}&permissions=${permissions}`,
      },
    };
  }

  async getGuilds() {
    try {
      const guilds = await this.client.guilds.fetch();
      return { ok: true, data: { guilds } };
    } catch (error) {
      console.error("Failed to get guilds:", error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async getChannel({ channelId }) {
    try {
      const channel = await this.client.channels.fetch(channelId);

      return { ok: true, data: { channel } };
    } catch (error) {
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async createCategory({ guildId, name }) {
    try {
      const guild = await this.client.guilds.fetch(guildId);
      const category = await guild.channels.create({
        name: name,
        type: ChannelType.GuildCategory,
      });

      return { ok: true, data: { category } };
    } catch (error) {
      console.error(`Failed to create category ${name}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async createTextChannel({ guildId, name, categoryId = null }) {
    try {
      const createOptions = {
        name: name,
        type: ChannelType.GuildText,
      };

      if (categoryId) {
        createOptions.parent = categoryId;
      }

      const guild = await this.client.guilds.fetch(guildId);
      const channel = await guild.channels.create(createOptions);

      return { ok: true, data: { channel } };
    } catch (error) {
      console.error(`Failed to create channel ${name}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async sendMessage({ channelId, message }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      const sentMessage = await channel.send(message);

      return { ok: true, data: { message: sentMessage } };
    } catch (error) {
      console.error(`Failed to send message to channel ${channelId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async updateMessage({ channelId, messageId, message: newMessage }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);
      await message.edit(newMessage);

      return { ok: true, data: { message } };
    } catch (error) {
      console.error(`Failed to update message ${messageId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async deleteMessage({ channelId, messageId }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);
      await message.delete();

      return { ok: true, data: { message } };
    } catch (error) {
      console.error(`Failed to delete message ${messageId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async createVoiceChannel({ guildId, name, categoryId = null }) {
    const createOptions = {
      name: name,
      type: ChannelType.GuildVoice,
    };

    if (categoryId) {
      createOptions.parent = categoryId;
    }

    const guild = await this.client.guilds.fetch(guildId);
    const channel = await guild.channels.create(createOptions);

    return { ok: true, data: { channel } };
  }

  async deleteCategory({ categoryId }) {
    try {
      const category = await this.client.channels.fetch(categoryId);
      await category.delete();

      return { ok: true, data: { category } };
    } catch (error) {
      console.error(`Failed to delete category ${categoryId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async deleteChannel({ channelId }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      await channel.delete();

      return { ok: true, data: { channel } };
    } catch (error) {
      console.error(`Failed to delete channel ${channelId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }
}

const discordService = new DiscordService();

module.exports = discordService;
