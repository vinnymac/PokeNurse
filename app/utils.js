const Immutable = {
  array: {
    set(array, index, item) {
      if (item === null) {
        return [
          ...array.slice(0, index),
          ...array.slice(index + 1)
        ]
      }

      return [
        ...array.slice(0, index),
        item,
        ...array.slice(index + 1)
      ]
    }
  }
}

const Organize = {
  sortAsString(array, sortBy, sortDir) {
    array.sort((a, b) => {
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

  sortAsNumber(array, sortBy, sortDir) {
    array.sort((a, b) => {
      if (sortDir === 'ASC') return a[sortBy] - b[sortBy]

      return b[sortBy] - a[sortBy]
    })
  }
}

export { Immutable, Organize }
