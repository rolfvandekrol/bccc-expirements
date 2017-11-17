
type Product<A, B> = {a: A, b: B};

type Morph<A, B> = {
	f: (_: A) => B,
	then: <C>(_: Morph<B, C>) => Morph<A, C>,
	comma: <C, D>(_: Morph<C, D>) => Morph<Product<A, C>, Product<B, D>>
};

const morph = <A, B>(f: (_: A) => B): Morph<A, B> => ({ 
	f,
	then: <C>(g: Morph<B, C>) => 
		morph<A, C>((a: A) => g.f(f(a))),
	comma: <C, D>(g: Morph<C, D>) => 
		morph<Product<A, C>, Product<B, D>>(
			(x: Product<A, C>) => product(
				f(first(x)), 
				g.f(second(x))
			)
		)
});

const product = <A, B>(a: A, b: B): Product<A, B> => ({ a, b});

const first = <A, _>(x: Product<A, _>): A => x.a;
const second = <_, A>(x: Product<_, A>): A => x.b;


/*
// Old implementations of round and comma before it became methods on Morph

const round = <A, B, C>(f: Morph<B, C>, g: Morph<A, B>): Morph<A, C> => 
	morph<A, C>((a: A) => f.f(g.f(a)));

const comma = <A, B, C, D>(f: Morph<A, B>, g: Morph<C, D>): Morph<Product<A, C>, Product<B, D>> => 
	morph<Product<A, C>, Product<B, D>>(
		(x: Product<A, C>) => product(f.f(first(x)), g.f(second(x)))
	);
*/

type List<A> = A[];
const List_map = <A, B>(m: Morph<A, B>): Morph<List<A>, List<B>> => 
	morph<List<A>, List<B>>(
		a => a.map(m.f)
	);

type Pair<A> = Product<A, A>;
const Pair_map = <A, B>(m: Morph<A, B>): Morph<Pair<A>, Pair<B>> => 
	morph<Pair<A>, Pair<B>>(
		a => product(m.f(first(a)), m.f(second(a)))
	);

// TODO: How to define a Functor type? Is that even possible?

let increment: Morph<number, number> = morph((a) => a+1);
let isEven: Morph<number, boolean> = morph((a) => a % 2 == 0);
let isOdd = increment.then(isEven);

let a: Pair<number> = product(1, 2);

let incr_pair = Pair_map<number, number>(increment);
let b = incr_pair.f(a);

let weird = increment.comma(isOdd);
let c = weird.f(b);

console.log(a, b, c);
