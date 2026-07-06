export function toId(value) {
  if (value == null) return value;
  if (typeof value === "object" && value._id != null) return String(value._id);
  return String(value);
}

export function normalizeDoc(doc) {
  if (!doc || typeof doc !== "object") return doc;

  const normalized = {
    ...doc,
    id: toId(doc._id || doc.id),
  };

  if (doc.guardId != null) normalized.guardId = toId(doc.guardId);
  if (doc.clientId != null) normalized.clientId = toId(doc.clientId);

  if (doc.joinDate) {
    normalized.joinDate =
      typeof doc.joinDate === "string"
        ? doc.joinDate.split("T")[0]
        : doc.joinDate;
  }

  return normalized;
}

export function normalizeDocs(docs) {
  return (Array.isArray(docs) ? docs : []).map(normalizeDoc);
}

export function stripDocMeta(doc) {
  const { id, _id, __v, createdAt, updatedAt, ...rest } = doc;
  return rest;
}
