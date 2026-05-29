/**
 * Habits service — CRUD over the backend `/habits` endpoint.
 *
 * Wraps the shared `api` fetch helper. All calls are opportunistic:
 * the UI persists locally (via HabitsContext + localStorage) for
 * instant feedback, then attempts to sync to the backend in the
 * background. Failures here are non-fatal — the UI continues to work
 * offline.
 */

import { api } from "./api";

const RESOURCE = "/api/habits";

export function listHabits({ signal } = {}) {
  return api.get(RESOURCE, { signal });
}

export function createHabit(habit) {
  return api.post(RESOURCE, habit);
}

export function updateHabit(id, patch) {
  return api.patch(`${RESOURCE}/${id}`, patch);
}

export function deleteHabit(id) {
  return api.delete(`${RESOURCE}/${id}`);
}

export default {
  list: listHabits,
  create: createHabit,
  update: updateHabit,
  remove: deleteHabit,
};
