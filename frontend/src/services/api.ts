import type { User, AuthCredentials, ShoppingItem, ShoppingItemResponse } from "../models/types";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export async function fetchItems(searchQuery: string): Promise<{ items: ShoppingItem[] }> {
    const res = await fetch(`${baseURL}/shopping/?${searchQuery}`, {
		credentials: 'include'
	})

    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }

    return res.json()
}

export async function registerUser(credentials: AuthCredentials): Promise<{ user: User }> {
	const response = await fetch(`${baseURL}/users/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Failed to register');
	return data;
}

export async function loginUser(credentials: AuthCredentials): Promise<{ user: User }> {
	const response = await fetch(`${baseURL}/users/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Failed to log in');
	return data;
}

export async function logoutUser(): Promise<{ message: string }> {
	const response = await fetch(`${baseURL}/users/logout`, {
		method: 'POST',
		credentials: 'include',
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Failed to log out');
	return data;
}

export async function getCurrentUser(): Promise<{ user: User }> {
	const response = await fetch(`${baseURL}/users/me`, {
		method: 'GET',
		credentials: 'include',
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Failed to get current user');
	return data;
}

export async function fetchUserItems(): Promise<{ items: ShoppingItemResponse[] }> {
	const response = await fetch(`${baseURL}/users/allitems`, {
		method: 'GET',
		credentials: 'include',
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Failed to fetch items');
	return data;
}

export async function addUserItem(item: ShoppingItem): Promise<{ item: ShoppingItemResponse }> {
	const response = await fetch(`${baseURL}/users/add-item`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(item),
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Failed to add item');
	return data;
}

export async function deleteUserItem(id: string | number): Promise<{ message: string }> {
    const response = await fetch(`${baseURL}/users/deleteitem/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete item');
    return data;
}