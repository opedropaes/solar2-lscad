module.exports = {
	async formatRequestedData (array) {

		for (let i = 0; i < array.length; i++) {
			array[i] = parseFloat(array[i].toFixed(3))
		}

		return array

	}
}