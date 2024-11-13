// todo - zod!
// Domain modeling

type ActionSearchParams = {
  re: RegExp;
  submatch?: ActionSearch[];
  type: "action";
};

/**
 * Matches within an existing regex expression. Helpful to get keys out to send server requests, or hide portions from the user if they're for display
 */
type ActionSearch = {
  re: RegExp;
  //   Used for server requests
  key?: string;
  style?: string[];
  //
  hide?: boolean;
};

type WidgetSearchParams = {};

type StyleMatch = {
  start: string;
  stop: string;
  css?: string;
};
