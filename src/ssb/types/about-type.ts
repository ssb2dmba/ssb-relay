export default interface SsbAbout {
    key: string;
    value: {
      hash: string;
      author: string;
      content: {
        name: string;
        type: string;
        about: string;
        description: null | string;
        actorId: string | null;
        inboxId: string | null;
      };
      previous: null | string;
      sequence: number;
      signature: string;
      timestamp: number;
    };
    timestamp: number;
  };
