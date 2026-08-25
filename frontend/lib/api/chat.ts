/**
 * Chat API Endpoints
 * Functions for interacting with the chat system
 * Note: Real-time messaging may use WebSocket in future
 */

import { apiClient } from './client';
import type {
  Channel,
  Message,
  CreateMessageDTO,
  ListResponse,
  ItemResponse,
  MessageListParams,
} from '@/types/api';

/**
 * Get list of channels
 * @returns List of channels user has access to
 */
export async function getChannels(): Promise<ListResponse<Channel>> {
  return apiClient.get('/channels');
}

/**
 * Get a specific channel
 * @param channelId - Channel ID
 * @returns Channel details
 */
export async function getChannel(
  channelId: string,
): Promise<ItemResponse<Channel>> {
  return apiClient.get(`/channels/${channelId}`);
}

/**
 * Get messages in a channel
 * @param channelId - Channel ID
 * @param params - Pagination parameters
 * @returns Paginated list of messages
 */
export async function getChannelMessages(
  channelId: string,
  params?: MessageListParams,
): Promise<ListResponse<Message>> {
  const queryString = new URLSearchParams({
    channelId,
  });

  if (params) {
    if (params.page) queryString.append('page', String(params.page));
    if (params.pageSize) queryString.append('pageSize', String(params.pageSize));
    if (params.search) queryString.append('search', params.search);
    if (params.sortBy) queryString.append('sortBy', params.sortBy);
    if (params.sortOrder) queryString.append('sortOrder', params.sortOrder);
  }

  const query = queryString.toString();
  const endpoint = `/messages${query ? `?${query}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Send a message to a channel
 * @param channelId - Channel ID
 * @param data - Message content and metadata
 * @returns Created message
 */
export async function sendMessage(
  channelId: string,
  data: CreateMessageDTO,
): Promise<ItemResponse<Message>> {
  return apiClient.post(`/channels/${channelId}/messages`, data);
}

/**
 * Get a specific message
 * @param messageId - Message ID
 * @returns Message details
 */
export async function getMessage(
  messageId: string,
): Promise<ItemResponse<Message>> {
  return apiClient.get(`/messages/${messageId}`);
}

/**
 * Get messages in a thread
 * @param threadId - Thread ID
 * @param params - Pagination parameters
 * @returns Paginated list of thread messages
 */
export async function getThreadMessages(
  threadId: string,
  params?: MessageListParams,
): Promise<ListResponse<Message>> {
  const queryString = new URLSearchParams({
    threadId,
  });

  if (params) {
    if (params.page) queryString.append('page', String(params.page));
    if (params.pageSize) queryString.append('pageSize', String(params.pageSize));
    if (params.search) queryString.append('search', params.search);
  }

  const query = queryString.toString();
  const endpoint = `/messages${query ? `?${query}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Search messages
 * @param query - Search query
 * @param channelId - Optional channel ID to limit search
 * @returns List of matching messages
 */
export async function searchMessages(
  query: string,
  channelId?: string,
): Promise<ListResponse<Message>> {
  const queryString = new URLSearchParams({
    search: query,
  });

  if (channelId) {
    queryString.append('channelId', channelId);
  }

  return apiClient.get(`/messages?${queryString.toString()}`);
}

/**
 * React to a message (emoji reaction)
 * Note: Specific endpoint for reactions
 */
export async function addReaction(
  messageId: string,
  emoji: string,
): Promise<{ success: boolean }> {
  return apiClient.post(`/messages/${messageId}/reactions`, { emoji });
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
  messageId: string,
  emoji: string,
): Promise<{ success: boolean }> {
  return apiClient.delete(`/messages/${messageId}/reactions/${emoji}`);
}

/**
 * Note: WebSocket/real-time functionality would be handled separately
 * This module provides HTTP-based message retrieval
 * For real-time updates, implement WebSocket connection in a separate module
 */
