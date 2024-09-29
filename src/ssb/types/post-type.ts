export default interface SsbPost {
    key: string;
    value: {
      hash: string;
      author: string;
      content: {
        text: string;
        summary: null | string;
        type: string;
        attribution: null | string;
        mentions:  {
          link: string;
          size: null | string;
          type: null | string;
        }[];
        
      };
      previous: null | string;
      sequence: number;
      signature: string;
      timestamp: number;
    };
    timestamp: number;
  };
