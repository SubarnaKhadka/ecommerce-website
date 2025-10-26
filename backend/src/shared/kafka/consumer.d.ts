import { EachMessagePayload } from "kafkajs";
export declare function startConsumer(groupId: string, topic: string, eachMessageHandler: (payload: EachMessagePayload) => Promise<void>): Promise<void>;
