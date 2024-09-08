export default interface SsbAbout {
  message: {
    key: string;
    value: {
      hash: string;
      author: string;
      content: {
        name: string;
        type: string;
        about: string;
        description: null | string;
        actorId: string | string;
      };
      previous: null | string;
      sequence: number;
      signature: string;
      timestamp: number;
    };
    timestamp: number;
  };
}
