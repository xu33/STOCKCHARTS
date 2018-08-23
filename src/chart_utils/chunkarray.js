export default function chunkArray(array, eachLength) {
  let results = [];
  let length = array.length;
  let chunkSize = Math.round(length / eachLength);

  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }

  return results;
}
