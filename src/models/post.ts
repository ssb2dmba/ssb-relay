export interface Post {
        message: {
            key: string;
            value: {
                hash: string,
                author: string,

                content: {
                    text: string,
                    type: string
                },
                previous: string,
                sequence: number,
                signature: string,
                timestamp: number
            }
            timestamp: number
        }
}