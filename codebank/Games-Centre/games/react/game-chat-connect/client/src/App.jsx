"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wouter_1 = require("wouter");
const queryClient_1 = require("./lib/queryClient");
const react_query_1 = require("@tanstack/react-query");
const toaster_1 = require("@/components/ui/toaster");
const tooltip_1 = require("@/components/ui/tooltip");
const react_1 = require("react");
const Home = (0, react_1.lazy)(() => Promise.resolve().then(() => require("@/pages/home")));
const Game = (0, react_1.lazy)(() => Promise.resolve().then(() => require("@/pages/game")));
const NotFound = (0, react_1.lazy)(() => Promise.resolve().then(() => require("@/pages/not-found")));
function Router() {
    return (<wouter_1.Switch>
      <wouter_1.Route path="/" component={() => (<react_1.Suspense fallback={<div>Loading...</div>}>
          <Home />
        </react_1.Suspense>)}/>
      <wouter_1.Route path="/game/:roomCode" component={() => (<react_1.Suspense fallback={<div>Loading...</div>}>
          <Game />
        </react_1.Suspense>)}/>
      <wouter_1.Route component={() => (<react_1.Suspense fallback={<div>Loading...</div>}>
          <NotFound />
        </react_1.Suspense>)}/>
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
