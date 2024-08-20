const error = (e) => {
  if (e instanceof Error) {
    console.error(e.message)
  } else {
    console.error(String(e))
  }
  process.exit(1)
}

module.exports = error