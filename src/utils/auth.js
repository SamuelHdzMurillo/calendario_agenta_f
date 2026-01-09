// Utilidades para manejo de autenticación y roles

/**
 * Obtiene la información del usuario desde localStorage
 * @returns {Object|null} Objeto con información del usuario o null si no existe
 */
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error al parsear información del usuario:", error);
    return null;
  }
};

/**
 * Obtiene los roles del usuario actual
 * @returns {Array} Array de roles del usuario o array vacío si no hay roles
 */
export const getUserRoles = () => {
  const user = getUser();
  return user?.roles || [];
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar
 * @returns {boolean} true si el usuario tiene el rol, false en caso contrario
 */
export const hasRole = (role) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 * @param {Array<string>} roles - Array de roles a verificar
 * @returns {boolean} true si el usuario tiene al menos uno de los roles
 */
export const hasAnyRole = (roles) => {
  const userRoles = getUserRoles();
  return roles.some((role) => userRoles.includes(role));
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario tiene un token válido
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

/**
 * Cierra la sesión del usuario eliminando el token y la información del usuario
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Obtiene el ID del usuario actual
 * @returns {number|null} ID del usuario o null si no existe
 */
export const getUserId = () => {
  const user = getUser();
  return user?.id || user?.user_id || null;
};

