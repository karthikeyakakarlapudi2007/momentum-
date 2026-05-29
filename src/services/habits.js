/**
 * Habits service — CRUD over the backend `/api/habits` endpoints.
 *
 * Routes match the Express backend exactly:
 *   GET    /api/habits/all        → list all habits
 *   POST   /api/habits/add        → create a habit
 *   PUT    /api/habits/update/:id → update a habit
 *   DELETE /api/habits/delete/:id → delete a habit
 */

import { api } from "./api";

export function listHabits({ signal } = {}) {
  return api.get("/api/habits/all", { signal });
}

export function createHabit(habit) {
  return api.post("/api/habits/add", habit);
}

export function updateHabit(id, patch) {
  return api.put(`/api/habits/update/${id}`, patch);
}

export function toggleHabit(id) {
  return api.post(`/api/habits/toggle/${id}`, {});
}

export function deleteHabit(id) {
  return api.delete(`/api/habits/delete/${id}`);
}

export default {
  list: listHabits,
  create: createHabit,
  update: updateHabit,
  toggle: toggleHabit,
  remove: deleteHabit,
};
