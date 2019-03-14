const state = {
  filePath: 'ss',
  frameFolderPath: '',
}

const mutations = {
  SET_FRAMEFOLDERPATH(state, folderPath) {
    state.frameFolderPath = folderPath
  },
  SET_FILEPATH(state, filePath) {
    state.filePath = filePath
  },
}

const actions = {
  setFrameFolderPath({ commit }, path) {
    commit('SET_FRAMEFOLDERPATH', path)
  },
  setFilePath({ commit }, path) {
    commit('SET_FILEPATH', path)
  },
}

export default {
  state,
  mutations,
  actions,
}
