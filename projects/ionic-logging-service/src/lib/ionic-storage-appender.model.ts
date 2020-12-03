import * as log4javascript from "log4javascript";

import { IonicStorageAppenderConfiguration } from "./ionic-storage-appender.configuration";
import { LogLevelConverter } from "./log-level.converter";
import { LogLevel } from "./log-level.model";
import { LogMessage } from "./log-message.model";
import { Storage } from "@ionic/storage";
/**
 * An appender which stores the log messages in the ionic local storage (SQL lite).
 *
 * The messages are saved JSON-serialized.
 * You have to configure which key is used for storing the messages.
 *
 * A typical configuration could be:
 *
 * ```json
 * {
 *   "ionicStorageKey": "myLogs",
 *   "maxMessages": 500,
 *   "threshold": "INFO"
 * }
 * ```
 */
export class IonicStorageAppender extends log4javascript.Appender {

	/**
	 * Creates a new instance of the appender.
	 * @param configuration configuration for the appender.
	 * @param storage the Ionic storage database. We assume that there is one instance of storage.
	 */
	constructor(configuration: IonicStorageAppenderConfiguration, storage: Storage) {
		super();

		this.configuration = configuration;

		if (!configuration) {
			throw new Error("configuration must be not empty");
		}
		// tslint:disable-next-line:no-null-keyword
		if (!configuration.ionicStorageKey || configuration.ionicStorageKey === "") {
			throw new Error("ionicStorageKey must be not empty");
		}

		// We assume there is only one instance of storage.
		IonicStorageAppender.ionicStorage = storage;
		this.ionicStorageKey = configuration.ionicStorageKey;
	}

	private static maxMessagesDefault = 250;
	private static thresholdDefault = "WARN";
	private static ionicStorage: Storage = undefined;

	private maxMessages: number;


	// tslint:disable-next-line:completed-docs
	private ionicStorageKey: string;
	// tslint:disable-next-line:completed-docs
	private logMessages: LogMessage[];

	private configuration: IonicStorageAppenderConfiguration;

	/**
	 * Load log messages from ionic local storage which are stored there under the given key.
	 * @return stored messages
	 */
	public static async loadLogMessages(ionicStorageKey: string): Promise<LogMessage[]> {
		let logMessages: LogMessage[];

		if (!ionicStorageKey || await IonicStorageAppender.ionicStorage.get(ionicStorageKey) === null) {
			logMessages = [];
		} else {
			const parse = await IonicStorageAppender.ionicStorage.get(ionicStorageKey);
			logMessages = JSON.parse(parse);
			for (const logMessage of logMessages) {
				// timestamps are serialized as strings
				logMessage.timeStamp = new Date(logMessage.timeStamp);
			}
		}

		return logMessages;
	}

	/**
	 * Remove log messages from ionic local storage which are stored there under the given key.
	 * @param ionicStorageKey local storage key
	 */
	public static async removeLogMessages(ionicStorageKey: string) {
		return IonicStorageAppender.ionicStorage.remove(ionicStorageKey);
	}

	/**
	 * Initialize the appender.
	 */
	public async initIonicStorageAppender(): Promise<void> {
		// read existing logMessages
		// tslint:disable-next-line:no-null-keyword
		this.logMessages = await IonicStorageAppender.loadLogMessages(this.ionicStorageKey);
		// process remaining configuration
		try {
			this.configure({
				ionicStorageKey: this.configuration.ionicStorageKey,
				maxMessages: this.configuration.maxMessages || IonicStorageAppender.maxMessagesDefault,
				threshold: this.configuration.threshold || IonicStorageAppender.thresholdDefault,
			});
		} catch (error) {
			Promise.reject(error);
		}

	}

	/**
	 * Configures the logging depending on the given configuration.
	 *
	 * Only the defined properties get overwritten.
	 * The ionicStorageKey cannot be modified.
	 *
	 * @param configuration configuration data.
	 */
	public async configure(configuration: IonicStorageAppenderConfiguration): Promise<void> {
		if (configuration) {
			if (configuration.ionicStorageKey && configuration.ionicStorageKey !== this.ionicStorageKey) {
				throw new Error("ionicStorageKey must not be changed");
			}
			if (configuration.maxMessages) {
				this.setMaxMessages(configuration.maxMessages);
			}
			if (configuration.threshold) {
				try {
					const convertedThreshold = LogLevelConverter.levelToLog4Javascript(
						LogLevelConverter.levelFromString(configuration.threshold));
					this.setThreshold(convertedThreshold);
				} catch (error) {
					Promise.reject(error);
				}

			}
		}
	}

	/**
	 * Appender-specific method to append a log message.
	 * @param loggingEvent event to be appended.
	 */
	public async append(loggingEvent: log4javascript.LoggingEvent): Promise<void> {
		// if logMessages is already full, remove oldest element
		while (this.logMessages.length >= this.maxMessages) {
			this.logMessages.shift();
		}
		// add event to logMessages
		const message: LogMessage = {
			level: LogLevel[LogLevelConverter.levelFromLog4Javascript(loggingEvent.level)],
			logger: typeof loggingEvent.logger !== "undefined" ? loggingEvent.logger.name : undefined,
			message: loggingEvent.messages.slice(1),
			methodName: loggingEvent.messages[0],
			timeStamp: loggingEvent.timeStamp,
		};
		this.logMessages.push(message);

		// write values to ionicStorage
		IonicStorageAppender.ionicStorage.set(this.ionicStorageKey, JSON.stringify(this.logMessages));
	}

	/**
	 * Gets the appender's name.
	 * Mainly for unit testing purposes.
	 * @return appender's name
	 */
	public toString(): string {
		return "Ionic.Logging.IonicStorageAppender";
	}

	/**
	 * Get the key which is used to store the messages in the ionic local storage.
	 */
	public getIonicStorageKey(): string {
		return this.ionicStorageKey;
	}

	/**
	 * Get the maximum number of messages which will be stored in ionic local storage.
	 */
	public getMaxMessages(): number {
		return this.maxMessages;
	}

	/**
	 * Set the maximum number of messages which will be stored in local storage.
	 *
	 * If the appender stores currently more messages than the new value allows, the oldest messages get removed.
	 * @param value new maximum number
	 */
	public setMaxMessages(value: number): void {
		if (this.maxMessages !== value) {
			this.maxMessages = value;

			if (this.logMessages.length > this.maxMessages) {
				// there are too much logMessages for the new value, therefore remove oldest messages
				while (this.logMessages.length > this.maxMessages) {
					this.logMessages.shift();
				}

				// write values to ionicStorage
				IonicStorageAppender.ionicStorage.set(this.ionicStorageKey, JSON.stringify(this.logMessages));
			}
		}
	}

	/**
 * Gets all messages stored in ionic storage.
 * Mainly for unit testing purposes.
 * @return stored messages
 */
	public getLogMessages(): LogMessage[] {
		return this.logMessages;
	}

	/**
	 * Removes all messages from ionic storage.
	 * Mainly for unit testing purposes.
	 */
	public async clearLog(): Promise<void> {
		this.logMessages = [];
		await IonicStorageAppender.ionicStorage.remove(this.ionicStorageKey);
	}

}
