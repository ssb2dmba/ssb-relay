export interface About {
    message: {
    key: string;
    value: {
        hash: string,
        author: string,
        content: {
            name: string,
            type: string,
            about: string
        },
        previous: string,
        sequence: number,
        signature: string,
        timestamp: number
    },
    timestamp: number
  }
}
  