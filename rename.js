#!/usr/bin/env node
const http = require('http')
const fs = require('fs')

const url = 'http://pokeapi.co/api/v2/pokemon-species/'

let results = []

const receivedAllResults = () => {
  const filename = './names.json'
  fs.writeFile(filename, JSON.stringify({ results }, null, 2), (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Wrote Results to ', filename)
    }
  })
}

const getSpeciesPage = (link) => {
  if (!link) return
  let body = ''

  return http.get(link, (resp) => {
    resp.setEncoding('utf8')

    resp.on('data', (chunk) => { body += chunk })

    resp.on('end', () => {
      const parsed = JSON.parse(body)
      console.log('Response', parsed.next)

      results = [
        ...results,
        ...parsed.results,
      ]

      // check if we have all of them
      if (!parsed.next) {
        receivedAllResults()
      } else {
        // Get next page
        setTimeout(() => {
          getSpeciesPage(parsed.next)
        }, 500)
      }

    })
  }).on('error', (e) => {
    console.log('Error ', e.message)
  })
}

// Start fetching pages
// getSpeciesPage(url)

const names = require('./names.json').results

// console.log('Index: ', names.findIndex(p => p.name === 'venusaur'))

const rename = () => {
  const dir = './app/imgs/3d/'
  fs.readdir(dir, (err, files) => {
    files.forEach((file, i) => {
      if (String(file) === '0-credits.txt') return // skip non pokemon files

      const name = String(file).split('.webp')[0].toLowerCase()

      let endOfName

      const pokemonId = names.findIndex(p => {
        const pokemonName = p.name
          .replace(' ', '')
          .replace('-o', ' o')
          .replace('type:null', 'typenull')
          .replace('nidoran-f', 'nidoran ♀')
          .replace('nidoran-m', 'nidoran ♂')
          .replace('mime-jr', 'mime jr')
          .replace('mr-mime', 'mr mime')
          .replace('porygon-z', 'porygon z')
          // .replace('porygon2', 'porygon 2')
        // endOfName = name.split(pokemonName)[1]
        const parts = name.split(/-([0-9]|[a-z]|[A-Z])/g)
        const parsedName = parts[0]
        endOfName = parts.slice(-2).join('')
        if (endOfName === parsedName) endOfName = ''
        // if (pokemonName.startsWith('venusaur')) console.log('POKEMON NAME', pokemonName, parts)
        return parsedName === pokemonName
        // return name.startsWith(pokemonName)
      }) + 1

      if (endOfName) {
        endOfName = '-' + endOfName
      } else {
        endOfName = ''
      }

      if (pokemonId === 0) {
        throw new Error('Failed for ' + file)
      }
      const originalFilepath = dir + String(file)
      const newFilepath = dir + pokemonId + endOfName + '.webp'
      // console.log('newFilepath:', newFilepath)
      console.log('Index:', i, 'Filename:', file, 'ID:', pokemonId, 'originalFilepath:', originalFilepath, 'newFilepath:', newFilepath)
      fs.rename(originalFilepath, newFilepath, (err) => {
        if (err) throw err
        console.log('Renamed', originalFilepath, 'to', newFilepath)
      })
    })
  })
}

rename()
