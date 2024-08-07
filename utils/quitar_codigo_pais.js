const codigosDePaisLatam = [
  "54", // Argentina
  "55", // Brasil
  "56", // Chile
  "57", // Colombia
  "58", // Venezuela
  "52", // México
  "53", // Cuba
  "59", // Guyana
  "60", // Surinam
  "61", // Brasil (considerado en el grupo 55 para Brasil)
  "62", // Brasil (considerado en el grupo 55 para Brasil)
  "63", // Paraguay
  "64", // Bolivia
  "65", // Perú
  "66", // Ecuador
  "67", // Uruguay
  "68", // Colombia (considerado en el grupo 57 para Colombia)
  "69", // Colombia (considerado en el grupo 57 para Colombia)
];

function quitarCodigoPais(numero) {
  // Ordenar los códigos de país por longitud en orden descendente
  // para asegurar que se coincida con los códigos más largos primero
  const codigosOrdenados = codigosDePaisLatam.sort(
    (a, b) => b.length - a.length
  );

  for (const codigo of codigosOrdenados) {
    // Compara si el número comienza con el código de país
    if (numero.startsWith(codigo)) {
      // Si encuentra una coincidencia, quita el código de país y devuelve el número restante
      return numero.slice(codigo.length);
    }
  }

  // Si no se encuentra un código de país válido, devuelve el número original
  return numero;
}

module.exports = {
  quitarCodigoPais,
};
