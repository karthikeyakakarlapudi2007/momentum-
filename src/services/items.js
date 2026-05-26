/**
 * Items service — CRUD over the backend `/items` endpoint.
 *
 * Wraps fetch (via the shared api helper) so components never
 * call `fetch` directly. Swap the endpoint name when the backend
 * exposes a more specific resource (e.g. /habits).
 */

import { api } from "./api";

const RESOURCE = "/items";

export function listItems({ signal } = {}) {
  return api.get(RESOURCE, { signal });
}

export function getItem(id, { signal } = {}) {
  return api.get(`${RESOURCE}/${id}`, { signal });
}

export function createItem(item) {
  return api.post(RESOURCE, item);
}

export function updateItem(id, patch) {
  return api.patch(`${RESOURCE}/${id}`, patch);
}

export function deleteItem(id) {
  return api.delete(`${RESOURCE}/${id}`);
}

export default {
  list: listItems,
  get: getItem,
  create: createItem,
  update: updateItem,
  remove: deleteItem,
};
