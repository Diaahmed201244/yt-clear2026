"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wouter_1 = require("wouter");
const queryClient_1 = require("./lib/queryClient");
const react_query_1 = require("@tanstack/react-query");
const toaster_1 = require("@/components/ui/toaster");
const tooltip_1 = require("@/components/ui/tooltip");
const not_found_1 = require("@/pages/not-found");
const game_1 = require("@/pages/game");
function Router() {
    return (<wouter_1.Switch>
      <wouter_1.Route path="/" component={game_1.default}/>
      <wouter_1.Route path="/game/:gameId" component={game_1.default}/>
      <wouter_1.Route component={not_found_1.default}/>
    </wouter_1.Switch>);
}
function App() {
    return (<react_query_1.QueryClientProvider client={queryClient_1.queryClient}>
      <tooltip_1.TooltipProvider>
        <toaster_1.Toaster />
        <Router />
      </tooltip_1.TooltipProvider>
    </react_query_1.QueryClientProvider>);
}
exports.default = App;
