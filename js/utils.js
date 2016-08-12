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

export { Immutable }
