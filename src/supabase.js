// Stub Supabase client to disable remote auth/DB calls while keeping the
// local app functional. This preserves the import surface used across
// the app but returns empty/no-op results so pages render without errors.

const makeQuery = (result = []) => {
	const obj = {
		// chainable methods
		select() { return obj; },
		insert() { return obj; },
		update() { return obj; },
		delete() { return obj; },
		order() { return obj; },
		eq() { return obj; },
		single() { return obj; },
		// thenable so `await supabase.from(...).select(...);` works
		then(resolve) {
			resolve({ data: result, error: null });
		},
	};
	return obj;
};

const supabase = {
	// Minimal auth surface
	auth: {
		async getSession() {
			return { data: { session: null } };
		},
		onAuthStateChange(_cb) {
			return { data: { subscription: { unsubscribe: () => {} } } };
		},
		async signInWithPassword() {
			return { error: null, data: null };
		},
		async signUp() {
			return { error: null, data: null };
		},
		async signOut() {
			return { error: null };
		},
	},

	// Minimal realtime surface
	channel() {
		const ch = {
			on() { return ch; },
			subscribe() { return { id: 'stub' }; },
		};
		return ch;
	},
	removeChannel() {
		// no-op
	},

	// Minimal query builder
	from(_table) {
		return makeQuery([]);
	},
};

export { supabase };
