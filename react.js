const {
  useRef,
  useState,
  createContext,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} = require("react")

function wrapSelector(cauldron, listenerId, selector) {
  if (!listenerId.current) listenerId.current = cauldron._nextListenerId()
  cauldron._activeListenerId = listenerId.current
  try {
    selector(cauldron)
  } finally {
    cauldron._activeListenerId = null
  }
}

function CauldronProvider({ cauldron, children }) {
  const getState = useCallback(() => cauldron, [cauldron])
  const wrapSelector = useCallback((listenerId, invokeSelector) => invokeSelector(), [cauldron])
  const contextData = useMemo(() => ({ getState, wrapSelector }), [getState, wrapSelector])

  return <CauldronContext.Provider value={contextData}>{children}</CauldronContext.Provider>
}

const CauldronContext = createContext({})

function useCauldronContext() {
  return useContext(CauldronContext)
}

function useCauldron(selector) {
  const { cauldron, wrapSelector, unsubscribe } = useCauldronContext()
  const listenerId = useRef()
  const [computedState, setComputedState] = useState(wrapSelector(cauldron, listenerId, selector))
  useEffect(() => {
    return () => unsubscribe(listenerId.current)
  }, [])
}
