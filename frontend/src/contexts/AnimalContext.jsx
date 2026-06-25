import { createContext, useContext, useEffect, useReducer } from 'react'
import { animalReducer, initialState } from './animalReducer.js'

const AnimalContext = createContext()

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formatBreedName(breed, subBreed = '') {
  if (subBreed) {
    return `${subBreed} ${breed}`
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return breed.charAt(0).toUpperCase() + breed.slice(1)
}

export function AnimalProvider({ children }) {
  const [state, dispatch] = useReducer(animalReducer, initialState)

  useEffect(() => {
    async function loadBreeds() {
      try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all')
        const data = await response.json()

        if (data.status !== 'success') {
          throw new Error('Não foi possível carregar a lista de raças.')
        }

        const breeds = Object.entries(data.message).flatMap(([breed, subBreeds]) => {
          if (subBreeds.length === 0) {
            return [{ breed, subBreed: '', name: formatBreedName(breed) }]
          }

          return subBreeds.map((subBreed) => ({
            breed,
            subBreed,
            name: formatBreedName(breed, subBreed),
          }))
        })

        dispatch({ type: 'LOAD_BREEDS_SUCCESS', payload: breeds })
      } catch (error) {
        dispatch({
          type: 'SEARCH_ERROR',
          payload: 'Erro ao carregar raças. Verifique sua conexão e tente novamente.',
        })
      }
    }

    loadBreeds()
  }, [])

  async function searchBreed(searchTerm) {
    dispatch({ type: 'SEARCH_START' })

    const normalizedSearch = normalizeText(searchTerm)

    const foundBreed = state.breeds.find((item) => {
      return normalizeText(item.name) === normalizedSearch
    })

    if (!foundBreed) {
      dispatch({
        type: 'SEARCH_ERROR',
        payload: 'Raça não encontrada. Verifique o nome digitado ou escolha uma opção da lista.',
      })
      return
    }

    try {
      const url = foundBreed.subBreed
        ? `https://dog.ceo/api/breed/${foundBreed.breed}/${foundBreed.subBreed}/images/random/6`
        : `https://dog.ceo/api/breed/${foundBreed.breed}/images/random/6`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== 'success') {
        throw new Error('Erro na API')
      }

      dispatch({
        type: 'SEARCH_SUCCESS',
        payload: {
          breed: foundBreed.breed,
          subBreed: foundBreed.subBreed,
          displayName: foundBreed.name,
          images: data.message,
        },
      })
    } catch (error) {
      dispatch({
        type: 'SEARCH_ERROR',
        payload: 'Não foi possível buscar as imagens dessa raça. Tente novamente.',
      })
    }
  }

  function changeRandomImage() {
    if (state.images.length === 0) return

    const randomIndex = Math.floor(Math.random() * state.images.length)
    dispatch({ type: 'CHANGE_RANDOM_IMAGE', payload: state.images[randomIndex] })
  }

  function clearHistory() {
    dispatch({ type: 'CLEAR_HISTORY' })
  }

  const value = {
    ...state,
    searchBreed,
    changeRandomImage,
    clearHistory,
  }

  return <AnimalContext.Provider value={value}>{children}</AnimalContext.Provider>
}

export function useAnimal() {
  const context = useContext(AnimalContext)

  if (!context) {
    throw new Error('useAnimal deve ser usado dentro de AnimalProvider')
  }

  return context
}
