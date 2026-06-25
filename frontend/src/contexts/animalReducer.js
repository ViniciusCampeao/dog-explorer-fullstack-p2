export const initialState = {
  breeds: [],
  selectedBreed: '',
  selectedSubBreed: '',
  images: [],
  randomImage: '',
  history: [],
  loading: false,
  error: '',
}

export function animalReducer(state, action) {
  switch (action.type) {
    case 'LOAD_BREEDS_SUCCESS':
      return {
        ...state,
        breeds: action.payload,
        error: '',
      }

    case 'SEARCH_START':
      return {
        ...state,
        loading: true,
        error: '',
        images: [],
        randomImage: '',
      }

    case 'SEARCH_SUCCESS': {
      const newHistory = [
        action.payload.displayName,
        ...state.history.filter((item) => item !== action.payload.displayName),
      ].slice(0, 5)

      return {
        ...state,
        loading: false,
        selectedBreed: action.payload.breed,
        selectedSubBreed: action.payload.subBreed,
        images: action.payload.images,
        randomImage: action.payload.images[0] || '',
        history: newHistory,
        error: '',
      }
    }

    case 'SEARCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        images: [],
        randomImage: '',
      }

    case 'CHANGE_RANDOM_IMAGE':
      return {
        ...state,
        randomImage: action.payload,
      }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: [],
      }

    default:
      return state
  }
}
