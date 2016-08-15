let Immutable = {
  array: {
    set (array, index, item) {
      return [
        ...array.slice(0, index),
        item,
        ...array.slice(index + 1)
      ]
    }
  }
}

let Organize = {
  sortAsString (array, sortBy, sortDir) {
    array.sort(function (a, b) {
      if (sortDir === 'ASC') {
        if (a[sortBy] > b[sortBy]) return 1
        if (a[sortBy] < b[sortBy]) return -1
      } else {
        if (a[sortBy] > b[sortBy]) return -1
        if (a[sortBy] < b[sortBy]) return 1
      }

      return 0
    })
  },

  sortAsNumber (array, sortBy, sortDir) {
    array.sort(function (a, b) {
      if (sortDir === 'ASC') {
        return a[sortBy] - b[sortBy]
      } else {
        return b[sortBy] - a[sortBy]
      }
    })
  }
}

export { Immutable, Organize }
