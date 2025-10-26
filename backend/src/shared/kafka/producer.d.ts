export declare const producer: import("kafkajs").Producer;
export declare function connectProducer(): Promise<void>;
export declare function emitEvent(topic: string, message: any): Promise<void>;
