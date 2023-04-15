export interface Scuttlebot {
    last: {
        get: Function
    };
    on: Function;
    peers: any;
    publicKey: any;
    auth: { hook: Function };
    address: Function;
    getAddress: Function;
    manifest: Function;
    getManifest: Function;
    conf: object;
    connect: Function;
    close: Function;
    /**
     * e.g. '@QlCTpvY7p9ty2yOFrv1WU1AE88aoQc4Y7wYal7PFc+w=.ed25519'
     */
    id: string;
    keys: {
      curve: string;
      public: string;
      private: string;
      /**
       * e.g. '@QlCTpvY7p9ty2yOFrv1WU1AE88aoQc4Y7wYal7PFc+w=.ed25519'
       */
      id: string;
    };
    usage: Function;
    publish: Function;
    add: Function;
    get: Function;
    pre: Function;
    post: Function;
    latest: Function;
    getLatest: Function;
    latestSequence: Function;
    createFeed: Function;
    whoami: Function;
    relatedMessages: Function;
    query: {
      read(opts: any): any;
    };
    createFeedStream: Function;
    createHistoryStream: Function;
    createLogStream: Function;
    createUserStream: Function;
    links: Function;
    sublevel: Function;
    messagesByType: Function;
    createWriteStream: Function;
    isFollowing: Function;
    plugins: {
      install: Function;
      uninstall: Function;
      enable: Function;
      disable: Function;
    };
    gossip: {
      wakeup: number;
      peers(): Array<object>;
      get: Function;
      connect: Function;
      disconnect: Function;
      changes: Function;
      add: Function;
      remove: Function;
      ping: Function;
      reconnect: Function;
    };
    friends: {
      get: Function;
      all: Function;
      path: Function;
      createFriendStream: Function;
      hops: Function;
      isFollowing: Function;
    };
    replicate: {
      changes: Function;
      upto: Function;
    };
    blobs: {
      has: Function;
      size: Function;
      get: Function;
      add: Function;
      ls: Function;
      changes: Function;
      want(hash: string, cb: (err: any, has: boolean) => void): void;
      push: Function;
      pushed: Function;
      createWants: Function;
    };
    invite: {
      create: Function;
      accept(err: any, results: any): void;
    };
    block: {
      isBlocked: Function;
    };
    local: any;
    private: {
      publish: Function;
      unbox: Function;
    };
  }