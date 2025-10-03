const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_GUILD_ID } = require('../config');

class DiscordService {
  constructor() {
    this.client = null;
    this.guild = null;
    this._connected = false;
    this.categoryCache = new Map(); // name -> category
    this.categoryIdCache = new Map(); // id -> category
    this.channelCache = new Map(); // name -> channel
    this.channelIdCache = new Map(); // id -> channel
    this.messageCache = new Map();
    this.userCache = new Map(); // id -> user
  }

  async connect(token, guildId) {
    if (this._connected) {
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    return new Promise((resolve, reject) => {
      this.client.once('ready', async () => {
        try {
          console.log(`Discord bot ready! Logged in as ${this.client.user.tag}`);
          this.guild = await this.client.guilds.fetch(guildId);
          this._connected = true;
          console.log(`DiscordService connected to guild: ${this.guild.name}`);
          resolve();
        } catch (error) {
          console.error('Failed to fetch guild:', error);
          reject(error);
        }
      });

      this.client.on('error', (error) => {
        console.error('Discord client error:', error);
      });

      this.client.login(token).catch(reject);
    });
  }

  async tryConnect(token = DISCORD_TOKEN, guildId = DISCORD_GUILD_ID) {
    if (!token || !guildId) {
      console.log('Discord credentials not provided, Discord features will be unavailable');
      return false;
    }

    try {
      await this.connect(token, guildId);
      console.log('DiscordService connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect DiscordService:', error);
      return false;
    }
  }

  isConnected() {
    return (this._connected && this.client && this.guild);
  }

  /**
   * Check if a user exists in the guild and cache them
   * @param {string} userId Discord user ID
   * @returns {Promise<boolean>} True if user exists in guild
   */
  async validateUser(userId) {
    if (!this.isConnected()) {
      return false;
    }

    // Check cache first
    if (this.userCache.has(userId)) {
      return true;
    }

    try {
      const member = await this.guild.members.fetch(userId);
      if (member) {
        this.userCache.set(userId, member);
        return true;
      }
    } catch (error) {
      console.error(`User ${userId} not found in guild:`, error.message);
    }

    return false;
  }

  /**
   * Validate multiple user IDs and return only valid ones
   * @param {string[]} userIds Array of Discord user IDs
   * @returns {Promise<string[]>} Array of valid user IDs
   */
  async validateUsers(userIds) {
    if (!this.isConnected() || !userIds || userIds.length === 0) {
      return [];
    }

    const validUsers = [];
    for (const userId of userIds) {
      if (await this.validateUser(userId)) {
        validUsers.push(userId);
      }
    }

    return validUsers;
  }

  /**
   * Find a category channel by name
   * @param {string} name Category name
   * @returns {Promise<string|null>} Category ID or null if not found
   */
  async findCategory(name) {
    if (!this.isConnected()) {
      return null;
    }

    // Check cache first
    const cached = this.categoryCache.get(name);
    if (cached) {
      return cached.id;
    }

    // Try to find existing category
    const category = this.guild.channels.cache.find(
      channel => channel.name === name && channel.type === ChannelType.GuildCategory
    );

    if (category) {
      // Cache the found category by both name and ID
      this.categoryCache.set(name, category);
      this.categoryIdCache.set(category.id, category);
      return category.id;
    }

    return null;
  }

  /**
   * Create a category channel
   * @param {string} name Category name
   * @returns {Promise<string|null>} Category ID or null if failed
   */
  async createCategory(name) {
    if (!this.isConnected()) {
      return null;
    }

    try {
      const category = await this.guild.channels.create({
        name: name,
        type: ChannelType.GuildCategory
      });
      console.log(`Created category: ${name}`);

      // Cache the category by both name and ID
      this.categoryCache.set(name, category);
      this.categoryIdCache.set(category.id, category);
      return category.id;
    } catch (error) {
      console.error(`Failed to create category ${name}:`, error);
      return null;
    }
  }

  /**
   * Find or create a category channel by name
   * @param {string} name Category name
   * @returns {Promise<string|null>} Category ID
   */
  async findOrCreateCategory(name) {
    if (!this.isConnected()) {
      return null;
    }

    const found = await this.findCategory(name);
    if (found) {
      return found;
    }

    return await this.createCategory(name);
  }

  /**
   * Find a text channel by name
   * @param {string} name Channel name
   * @param {string} [categoryId] Optional category ID to filter by
   * @returns {Promise<string|null>} Channel ID or null if not found
   */
  async findChannel(name, categoryId) {
    if (!this.isConnected()) {
      return null;
    }

    // Check cache first
    const cached = this.channelCache.get(name);
    if (cached) {
      return cached.id;
    }

    // Try to find existing channel
    const channel = this.guild.channels.cache.find(
      ch => ch.name === name &&
            ch.type === ChannelType.GuildText &&
            (!categoryId || ch.parentId === categoryId)
    );

    if (channel) {
      // Cache the found channel by both name and ID
      this.channelCache.set(name, channel);
      this.channelIdCache.set(channel.id, channel);
      return channel.id;
    }

    return null;
  }

  /**
   * Create a text channel
   * @param {string} name Channel name
   * @param {string} [categoryId] Optional category ID to place the channel in
   * @param {string[]} [allowedUserIds] Optional array of Discord user IDs to make channel private
   * @returns {Promise<string|null>} Channel ID or null if failed
   */
  async createChannel(name, categoryId, allowedUserIds) {
    if (!this.isConnected()) {
      return null;
    }

    try {
      const createOptions = {
        name: name,
        type: ChannelType.GuildText
      };

      if (categoryId) {
        createOptions.parent = categoryId;
      }

      // Add permission overwrites for private channels
      if (allowedUserIds && allowedUserIds.length > 0) {
        // Validate users first
        const validUserIds = await this.validateUsers(allowedUserIds);

        if (validUserIds.length > 0) {
          createOptions.permissionOverwrites = [
            {
              id: this.guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: this.client.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
            },
            ...validUserIds.map(userId => ({
              id: userId,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            }))
          ];

          if (validUserIds.length !== allowedUserIds.length) {
            console.warn(`Only ${validUserIds.length} of ${allowedUserIds.length} users are valid for channel ${name}`);
          }
        } else {
          console.warn(`No valid users found for private channel ${name}, creating as public channel`);
        }
      }

      const channel = await this.guild.channels.create(createOptions);
      console.log(`Created channel: ${name}${categoryId ? ` in category ${categoryId}` : ''}${allowedUserIds ? ` (private for ${allowedUserIds.length} users)` : ''}`);

      // Cache the channel by both name and ID
      this.channelCache.set(name, channel);
      this.channelIdCache.set(channel.id, channel);
      return channel.id;
    } catch (error) {
      console.error(`Failed to create channel ${name}:`, error);
      return null;
    }
  }

  /**
   * Find or create a text channel by name
   * @param {string} name Channel name
   * @param {string} [categoryId] Optional category ID to place the channel in
   * @param {string[]} [allowedUserIds] Optional array of Discord user IDs to make channel private
   * @returns {Promise<string|null>} Channel ID
   */
  async findOrCreateChannel(name, categoryId, allowedUserIds) {
    if (!this.isConnected()) {
      return null;
    }

    const found = await this.findChannel(name, categoryId);
    if (found) {
      return found;
    }

    return await this.createChannel(name, categoryId, allowedUserIds);
  }

  /**
   * Send a message to a channel
   * @param {string} channelId Channel ID to send message to
   * @param {string} message Message content
   * @returns {Promise<string>} Message ID
   */
  async sendMessage(channelId, message) {
    if (!this.isConnected()) {
      return null;
    }

    // Check cache first
    let channel = this.channelIdCache.get(channelId);
    if (!channel) {
      channel = await this.client.channels.fetch(channelId);
      if (channel) {
        this.channelIdCache.set(channelId, channel);
      }
    }

    if (!channel || channel.type !== ChannelType.GuildText) {
      console.error(`Channel ${channelId} not found or is not a text channel`);
      return null;
    }

    const sentMessage = await channel.send(message);

    // Cache the message
    this.messageCache.set(sentMessage.id, sentMessage);

    return sentMessage.id;
  }

  /**
   * Update an existing message
   * @param {string} messageId Message ID to update
   * @param {string} message New message content
   * @returns {Promise<boolean>} True if updated successfully, false otherwise
   */
  async updateMessage(messageId, message) {
    if (!this.isConnected()) {
      return false;
    }

    // Try cache first
    let cachedMessage = this.messageCache.get(messageId);

    if (cachedMessage) {
      try {
        await cachedMessage.edit(message);
        console.log(`Updated message: ${messageId}`);
        return true;
      } catch (error) {
        // Message might have been deleted, remove from cache and try to fetch
        this.messageCache.delete(messageId);
      }
    }

    // Try to find the message in all text channels
    let foundMessage = null;

    for (const channel of this.guild.channels.cache.values()) {
      if (channel.type === ChannelType.GuildText) {
        try {
          foundMessage = await channel.messages.fetch(messageId);
          if (foundMessage) {
            break;
          }
        } catch (error) {
          // Message not in this channel, continue searching
        }
      }
    }

    if (!foundMessage) {
      console.error(`Message ${messageId} not found`);
      return false;
    }

    try {
      await foundMessage.edit(message);

      // Cache the found message
      this.messageCache.set(messageId, foundMessage);
      console.log(`Updated message: ${messageId}`);
      return true;
    } catch (error) {
      console.error(`Failed to update message ${messageId}:`, error);
      return false;
    }
  }

  /**
   * Create a voice channel
   * @param {string} name Channel name
   * @param {string} [categoryId] Optional category ID to place the channel in
   * @param {string[]} [allowedUserIds] Optional array of Discord user IDs to make channel private
   * @returns {Promise<string>} Channel ID
   */
  async createVoiceChannel(name, categoryId, allowedUserIds) {
    if (!this.isConnected()) {
      return null;
    }

    const createOptions = {
      name: name,
      type: ChannelType.GuildVoice
    };

    if (categoryId) {
      createOptions.parent = categoryId;
    }

    // Add permission overwrites for private channels
    if (allowedUserIds && allowedUserIds.length > 0) {
      // Validate users first
      const validUserIds = await this.validateUsers(allowedUserIds);

      if (validUserIds.length > 0) {
        createOptions.permissionOverwrites = [
          {
            id: this.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          },
          {
            id: this.client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels]
          },
          ...validUserIds.map(userId => ({
            id: userId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          }))
        ];

        if (validUserIds.length !== allowedUserIds.length) {
          console.warn(`Only ${validUserIds.length} of ${allowedUserIds.length} users are valid for voice channel ${name}`);
        }
      } else {
        console.warn(`No valid users found for private voice channel ${name}, creating as public channel`);
      }
    }

    const channel = await this.guild.channels.create(createOptions);
    console.log(`Created voice channel: ${name}${categoryId ? ` in category ${categoryId}` : ''}${allowedUserIds ? ` (private for ${allowedUserIds.length} users)` : ''}`);

    return channel.id;
  }

  /**
   * Delete a category channel by ID
   * @param {string} categoryId Category ID to delete
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise
   */
  async deleteCategory(categoryId) {
    if (!this.isConnected()) {
      return false;
    }

    // Check cache first
    let category = this.categoryIdCache.get(categoryId);

    if (!category) {
      try {
        category = await this.guild.channels.fetch(categoryId);
      } catch (error) {
        console.error(`Category ${categoryId} not found`);
        return false;
      }
    }

    if (!category || category.type !== ChannelType.GuildCategory) {
      console.error(`Channel ${categoryId} is not a category`);
      return false;
    }

    try {
      await category.delete();

      // Remove from both caches
      this.categoryIdCache.delete(categoryId);
      for (const [name, cachedCategory] of this.categoryCache) {
        if (cachedCategory.id === categoryId) {
          this.categoryCache.delete(name);
          break;
        }
      }

      console.log(`Deleted category: ${category.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete category ${categoryId}:`, error);
      return false;
    }
  }

  /**
   * Delete a channel by ID
   * @param {string} channelId Channel ID to delete
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise
   */
  async deleteChannel(channelId) {
    if (!this.isConnected()) {
      return false;
    }

    // Check cache first
    let channel = this.channelIdCache.get(channelId);

    if (!channel) {
      try {
        channel = await this.guild.channels.fetch(channelId);
      } catch (error) {
        console.error(`Channel ${channelId} not found`);
        return false;
      }
    }

    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildVoice)) {
      console.error(`Channel ${channelId} is not a text or voice channel`);
      return false;
    }

    try {
      await channel.delete();

      // Remove from both caches
      this.channelIdCache.delete(channelId);
      for (const [name, cachedChannel] of this.channelCache) {
        if (cachedChannel.id === channelId) {
          this.channelCache.delete(name);
          break;
        }
      }

      console.log(`Deleted channel: ${channel.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete channel ${channelId}:`, error);
      return false;
    }
  }

  /**
   * Delete a message by ID
   * @param {string} messageId Message ID to delete
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise
   */
  async deleteMessage(messageId) {
    if (!this.isConnected()) {
      return false;
    }

    // Try cache first
    let cachedMessage = this.messageCache.get(messageId);

    if (cachedMessage) {
      try {
        await cachedMessage.delete();
        this.messageCache.delete(messageId);
        console.log(`Deleted message: ${messageId}`);
        return true;
      } catch (error) {
        // Message might have been already deleted, remove from cache and try to find
        this.messageCache.delete(messageId);
      }
    }

    // Try to find the message in all text channels
    let foundMessage = null;

    for (const channel of this.guild.channels.cache.values()) {
      if (channel.type === ChannelType.GuildText) {
        try {
          foundMessage = await channel.messages.fetch(messageId);
          if (foundMessage) {
            break;
          }
        } catch (error) {
          // Message not in this channel, continue searching
        }
      }
    }

    if (!foundMessage) {
      console.error(`Message ${messageId} not found`);
      return false;
    }

    try {
      await foundMessage.delete();
      console.log(`Deleted message: ${messageId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete message ${messageId}:`, error);
      return false;
    }
  }
}

const discordService = new DiscordService();

module.exports = discordService;