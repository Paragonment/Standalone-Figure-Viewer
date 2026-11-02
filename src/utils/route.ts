import type { FigureGroup } from '../types';

// The app's address, as a URL hash (the app is served from a sub-path with a
// relative base, so a hash route is the one that needs no server support):
//
//   #/                                         the contents, or the list
//   #/?dance=waltz,tango&level=bronze&q=lock   ...with its filters and search
//   #/waltz/back-lock                          a figure
//   #/waltz/back-lock?part=follow&step=3
//   #/waltz/back-lock/practice                 Practice on top of it
//
// Pure: parsing, writing and matching only. useRoute holds the history.

export type PartParam = 'lead' | 'follow' | 'both';

export interface HomeRoute {
  screen: 'home';
  // Slugs (see slugify) of the dances and levels the list is filtered to.
  dances: string[];
  levels: string[];
  query: string;
  // What the address asked for, when it was not something that can open.
  missing?: string;
}

export interface FigureRoute {
  screen: 'figure' | 'practice';
  // Slugs of the figure's dance and name.
  dance: string;
  figure: string;
  part?: PartParam;
  // 1-based step the reader is at; absent for the first.
  step?: number;
}

export type Route = HomeRoute | FigureRoute;

const PARTS: PartParam[] = ['lead', 'follow', 'both'];

// "Whisk When Lead Turns 1/4" -> "whisk-when-lead-turns-1-4". Lowercase
// letters and digits joined by single hyphens; accents drop to their base
// letter and apostrophes vanish.
export const slugify = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// The words of a slug, for telling the reader what was not found.
export const unslug = (slug: string): string => slug.replace(/-+/g, ' ').trim();

export const homeRoute = (dances: string[] = [], levels: string[] = [], query = ''): HomeRoute => ({
  screen: 'home',
  dances: dances.map(slugify),
  levels: levels.map(slugify),
  query,
});

export const figureRoute = (
  figure: Pick<FigureGroup, 'dance' | 'name'>,
  extra: Partial<Pick<FigureRoute, 'screen' | 'part' | 'step'>> = {},
): FigureRoute => ({
  screen: 'figure',
  dance: slugify(figure.dance),
  figure: slugify(figure.name),
  ...extra,
});

// The entries of `names` whose slug is in `slugs`, in the order of `slugs`;
// a slug that names nothing is dropped.
export const matchSlugs = (slugs: string[], names: string[]): string[] =>
  slugs.flatMap((slug) => {
    const name = names.find((n) => slugify(n) === slug);
    return name === undefined ? [] : [name];
  });

const decode = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

const slugList = (value: string | null): string[] =>
  (value ?? '')
    .split(',')
    .map(slugify)
    .filter(Boolean);

export const parseRoute = (hash: string): Route => {
  const body = hash.replace(/^#/, '');
  const at = body.indexOf('?');
  const path = at === -1 ? body : body.slice(0, at);
  const params = new URLSearchParams(at === -1 ? '' : body.slice(at + 1));
  const segments = path.split('/').map(decode).filter(Boolean);

  if (segments.length === 0) {
    return {
      screen: 'home',
      dances: slugList(params.get('dance')),
      levels: slugList(params.get('level')),
      query: params.get('q') ?? '',
    };
  }

  const [dance, figure, tail] = segments.map((s) => slugify(s) || s);
  if (segments.length > 3 || figure === undefined || (tail !== undefined && tail !== 'practice')) {
    return { ...homeRoute(), missing: unslug(segments[segments.length - 1]) };
  }

  const route: FigureRoute = { screen: tail === 'practice' ? 'practice' : 'figure', dance, figure };
  const part = params.get('part');
  if (PARTS.includes(part as PartParam)) route.part = part as PartParam;
  const step = Number(params.get('step'));
  if (route.screen === 'figure' && Number.isInteger(step) && step > 1) route.step = step;
  return route;
};

export const formatRoute = (route: Route): string => {
  const params = new URLSearchParams();
  let path = '';
  if (route.screen === 'home') {
    if (route.dances.length > 0) params.set('dance', route.dances.join(','));
    if (route.levels.length > 0) params.set('level', route.levels.join(','));
    if (route.query !== '') params.set('q', route.query);
  } else {
    path = `${route.dance}/${route.figure}${route.screen === 'practice' ? '/practice' : ''}`;
    if (route.part) params.set('part', route.part);
    if (route.screen === 'figure' && route.step !== undefined && route.step > 1) params.set('step', String(route.step));
  }
  // A comma separates a list; it needs no escaping.
  const query = params.toString().replace(/%2C/g, ',');
  return `#/${path}${query ? `?${query}` : ''}`;
};

// `base` with its hash replaced by the route's.
export const linkTo = (base: string, route: Route): string => {
  const url = new URL(base);
  url.hash = formatRoute(route);
  return url.href;
};

export interface ResolvedRoute {
  // The open figure, or null on the list.
  figure: FigureGroup | null;
  screen: 'home' | 'figure' | 'practice';
  // Set when the address named something that is not there.
  missing: string | null;
}

export const resolveRoute = (figures: FigureGroup[], route: Route): ResolvedRoute => {
  if (route.screen === 'home') return { figure: null, screen: 'home', missing: route.missing ?? null };
  const figure = figures.find((f) => slugify(f.dance) === route.dance && slugify(f.name) === route.figure) ?? null;
  if (!figure) return { figure: null, screen: 'home', missing: unslug(route.figure) };
  return { figure, screen: route.screen, missing: null };
};
