function cleanString(input) {
  // Eliminar la etiqueta <citations> y todo lo que sigue en adelante
  let cleanedString = input.split("<citations>")[0];

  // Eliminar todas las referencias [^x.x.x] donde x es cualquier número
  cleanedString = cleanedString.replace(/\[\^\d+\.\d+\.\d+\]/g, "");

  // Eliminar los espacios al final del string
  cleanedString = cleanedString.trimEnd();

  return cleanedString;
}

module.exports = {
  cleanString,
};
