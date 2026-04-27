function isNonEmptyString(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateSessionCreate(body, caseExists) {
  if (!body || !isNonEmptyString(body.caseId, 100) || !caseExists(body.caseId)) {
    return "A valid caseId is required.";
  }

  if (body.learnerName != null && !isNonEmptyString(body.learnerName, 120)) {
    return "learnerName must be a non-empty string up to 120 characters when provided.";
  }

  return null;
}

function validateMessageCreate(body) {
  if (!body || !isNonEmptyString(body.message, 2000)) {
    return "A non-empty message up to 2000 characters is required.";
  }

  return null;
}

function validateEvaluation(body) {
  if (!body || !isNonEmptyString(body.diagnosis, 300)) {
    return "A non-empty diagnosis up to 300 characters is required.";
  }

  if (!isNonEmptyString(body.reasoning, 4000)) {
    return "A non-empty reasoning up to 4000 characters is required.";
  }

  return null;
}

function validateUserRegister(body) {
  if (!body) return "Request body is required.";
  if (!isNonEmptyString(body.name, 120)) return "A name up to 120 characters is required.";
  if (!isValidEmail(body.email)) return "A valid email address is required.";

  if (body.institution != null && typeof body.institution !== "string") {
    return "institution must be a string.";
  }

  if (body.yearOfStudy != null && !isNonEmptyString(body.yearOfStudy, 50)) {
    return "yearOfStudy must be a non-empty string up to 50 characters when provided.";
  }

  if (body.specialization != null && !isNonEmptyString(body.specialization, 100)) {
    return "specialization must be a non-empty string up to 100 characters when provided.";
  }

  const validRoles = ["student", "faculty"];
  if (body.role != null && !validRoles.includes(body.role)) {
    return `role must be one of: ${validRoles.join(", ")}`;
  }

  return null;
}

function validateUserLogin(body) {
  if (!body) return "Request body is required.";
  if (!isValidEmail(body.email)) return "A valid email address is required.";
  return null;
}

function validateUserUpdate(body) {
  if (!body) return "Request body is required.";
  if (body.name != null && !isNonEmptyString(body.name, 120)) {
    return "name must be a non-empty string up to 120 characters.";
  }
  return null;
}

module.exports = {
  validateSessionCreate,
  validateMessageCreate,
  validateEvaluation,
  validateUserRegister,
  validateUserLogin,
  validateUserUpdate
};
