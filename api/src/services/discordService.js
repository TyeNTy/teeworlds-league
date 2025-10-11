const { Client, GatewayIntentBits, ChannelType, Events, ActionRowBuilder, ButtonBuilder, MessageFlags } = require("discord.js");
const { DISCORD_CLIENT_ID, DISCORD_BOT_TOKEN } = require("../config");
const enumErrorCode = require("../enums/enumErrorCode");

class DiscordService {
  constructor() {
    this.client = null;
    this.buttonCallbacks = new Map(); // Store button callbacks
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

      this.client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton()) return;

        const callback = this.buttonCallbacks.get(interaction.customId);
        if (callback) {
          try {
            await callback(interaction);
          } catch (error) {
            console.error(`Error handling button interaction ${interaction.customId}:`, error);
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({ content: "An error occurred while processing your request.", flags: [MessageFlags.Ephemeral] });
            }
          }
        } else {
          console.warn(`No callback found for button: ${interaction.customId}`);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "This button is not configured.", flags: [MessageFlags.Ephemeral] });
          }
        }
      });

      this.client.login(DISCORD_BOT_TOKEN).catch(reject);
    });
  }

  registerButtonCallback(customId, callback) {
    this.buttonCallbacks.set(customId, callback);
  }

  unregisterButtonCallback(customId) {
    this.buttonCallbacks.delete(customId);
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

  async updateCategory({ categoryId, name }) {
    try {
      const category = await this.client.channels.fetch(categoryId);
      await category.setName(name);
      return { ok: true, data: { category } };
    } catch (error) {
      console.error(`Failed to update category ${categoryId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
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

  async createPrivateMessageChannel({ userId }) {
    try {
      const user = await this.client.users.fetch(userId);
      await user.createDM();

      return { ok: true };
    } catch (error) {
      console.error(`Failed to create private message channel ${userId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async sendPrivateMessage({ userId, message, buttons = null, embed = null }) {
    try {
      const user = await this.client.users.fetch(userId);
      await user.send(message);

      const messageOptions = {
        content: message,
      };

      if (buttons && buttons.length > 0) {
        const actionBuilder = new ActionRowBuilder();
        actionBuilder.addComponents(buttons);
        messageOptions.components = [actionBuilder];
      }

      if (embed) {
        messageOptions.embeds = [embed];
      }

      const sentMessage = await user.send(messageOptions);

      return { ok: true, data: { message: sentMessage } };
    } catch (error) {
      console.error(`Failed to send private message to ${userId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async sendMessage({ channelId, message, buttons = null, embed = null }) {
    try {
      const channel = await this.client.channels.fetch(channelId);

      const messageOptions = {
        content: message,
      };

      if (buttons && buttons.length > 0) {
        const actionBuilder = new ActionRowBuilder();
        actionBuilder.addComponents(buttons);
        messageOptions.components = [actionBuilder];
      }

      if (embed) {
        messageOptions.embeds = [embed];
      }

      const sentMessage = await channel.send(messageOptions);

      return { ok: true, data: { message: sentMessage } };
    } catch (error) {
      console.error(`Failed to send message to channel ${channelId}:`, error);
      return { ok: false, errorCode: enumErrorCode.SERVER_ERROR };
    }
  }

  async updateMessage({ channelId, messageId, message: newMessage, embed = null, buttons = null }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);

      const updateOptions = {
        content: newMessage,
      };

      if (embed) {
        updateOptions.embeds = [embed];
      }

      if (buttons) {
        const buttonRow = new ActionRowBuilder().addComponents(buttons);
        updateOptions.components = [buttonRow];
      }

      await message.edit(updateOptions);

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

  async updateChannel({ channelId, name }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      await channel.setName(name);
      return { ok: true, data: { channel } };
    } catch (error) {
      console.error(`Failed to update channel ${channelId}:`, error);
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
