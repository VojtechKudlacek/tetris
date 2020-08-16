const reducer: Store.Reducer = (state, action) => {
	if (action.key) {
		return {
			...state,
			[action.key]: action.value,
		}
	}
	return state;
};

export default reducer;
