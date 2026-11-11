import type {
	User,
	AuthCredentials,
	ShoppingItem,
	ShoppingItemResponse,
	ProductHistoryResponse,
	NotificationsResponse,
	Notification,
} from "../models/types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function requestJson<T>(
	path: string,
	fallbackMessage: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		credentials: 'include',
		...options,
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.message || fallbackMessage);
	}

	return response.json();
}

export async function fetchItems(searchQuery: string): Promise<{ items: ShoppingItem[] }> {
	return requestJson(`/shopping/?${searchQuery}`, 'Failed to fetch items');
}

export async function registerUser(credentials: AuthCredentials): Promise<{ user: User }> {
	return requestJson('/users/register', 'Failed to register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});
}

export async function loginUser(credentials: AuthCredentials): Promise<{ user: User }> {
	return requestJson('/users/login', 'Failed to log in', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});
}

export async function logoutUser(): Promise<{ message: string }> {
	return requestJson('/users/logout', 'Failed to log out', { method: 'POST' });
}

export async function getCurrentUser(): Promise<{ user: User }> {
	return requestJson('/users/me', 'Failed to get current user');
}

export async function fetchUserItems(): Promise<{ items: ShoppingItemResponse[] }> {
	return requestJson('/users/allitems', 'Failed to fetch items');
}

export async function addUserItem(item: ShoppingItem): Promise<{ item: ShoppingItemResponse }> {
	return requestJson('/users/add-item', 'Failed to add item', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(item),
	});
}

export async function deleteUserItem(id: string | number): Promise<{ message: string }> {
	return requestJson(`/users/deleteitem/${id}`, 'Failed to delete item', { method: 'DELETE' });
}

export async function fetchProductHistory(id: string | number): Promise<ProductHistoryResponse> {
	return requestJson(`/products/${id}/history`, 'Failed to fetch price history');
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
	return requestJson('/notifications', 'Failed to fetch notifications');
}

export async function markNotificationRead(id: number): Promise<{ notification: Notification }> {
	return requestJson(`/notifications/${id}/read`, 'Failed to update notification', { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
	return requestJson('/notifications/read-all', 'Failed to update notifications', { method: 'PATCH' });
}
