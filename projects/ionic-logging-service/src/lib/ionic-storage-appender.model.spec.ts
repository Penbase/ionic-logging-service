import { IonicStorageAppender } from "./ionic-storage-appender.model";
// tslint:disable:no-magic-numbers
import * as log4javascript from "log4javascript";
import { IonicStorageModule } from "@ionic/storage-angular";
import { TestBed } from "@angular/core/testing";
import { Storage } from "@ionic/storage-angular";
import { IonicStorageAppenderConfiguration } from "./ionic-storage-appender.configuration";

describe("IonicStorageAppender", () => {
	let storage: Storage;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [IonicStorageModule.forRoot()],
			providers: []
		}).compileComponents();
		storage = TestBed.inject(Storage);
		await storage.create();
	});

	afterEach(() => {
	});

	describe("ctor", () => {
		it("reads already stored messages", async () => {
			const today = new Date("2020-10-12T07:24:43.475Z");
			jasmine.clock().mockDate(today);

			const returnValue = "[{ \"level\": \"INFO\", \"message\": [], \"timeStamp\": \"2020-10-12T07:24:43.475Z\" }]";

			const appender = new IonicStorageAppender({ ionicStorageKey: "StoredMessages" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, []);
			appender.append(event);

			spyOn(storage, "get").and.returnValue(Promise.resolve(returnValue));
			const appender2 = new IonicStorageAppender({ ionicStorageKey: "StoredMessages" }, storage);
			await appender2.initIonicStorageAppender();

			const messages = appender2.getLogMessages();
			expect(messages.length).toBe(1);
			expect(messages[0].timeStamp).toEqual(event.timeStamp);
			expect(messages[0].level).toBe(event.level.toString());
		});
	});

	describe("ionicStorageKey", () => {
		it("throws error if configuration contains no ionicStorageKey", () => {

			expect(() => new IonicStorageAppender({} as IonicStorageAppenderConfiguration, storage)).
				toThrowError("ionicStorageKey must be not empty");
		});

		it("throws error if configuration contains empty ionicStorageKey", () => {

			expect(() => new IonicStorageAppender({ ionicStorageKey: "" }, storage)).
				toThrowError("ionicStorageKey must be not empty");
		});

		it("uses value from configuration", async () => {
			const config: IonicStorageAppenderConfiguration = {
				ionicStorageKey: "MyLocalStorage2",
			};

			const appender2 = new IonicStorageAppender(config, storage);
			await appender2.initIonicStorageAppender();

			expect(appender2.getIonicStorageKey()).toBe("MyLocalStorage2");
		});
	});

	describe("maxMessages", () => {
		it("uses default value if not specified", async () => {
			const config: IonicStorageAppenderConfiguration = {
				ionicStorageKey: "MyLocalStorage",
			};

			const appender2 = new IonicStorageAppender(config, storage);
			await appender2.initIonicStorageAppender();

			expect(appender2.getMaxMessages()).toBe(250);
		});

		it("uses value from configuration", async () => {
			const config: IonicStorageAppenderConfiguration = {
				ionicStorageKey: "MyLocalStorage",
				maxMessages: 42,
			};

			const appender2 = new IonicStorageAppender(config, storage);
			await appender2.initIonicStorageAppender();

			expect(appender2.getMaxMessages()).toBe(42);
		});
	});

	describe("threshold", () => {
		it("uses default value if not specified", async () => {
			const config: IonicStorageAppenderConfiguration = {
				ionicStorageKey: "MyLocalStorage",
			};

			const appender2 = new IonicStorageAppender(config, storage);
			await appender2.initIonicStorageAppender();

			expect(appender2.getThreshold()).toBe(log4javascript.Level.WARN);
		});

		it("uses value from configuration", async () => {
			const config: IonicStorageAppenderConfiguration = {
				ionicStorageKey: "MyLocalStorage",
				threshold: "INFO",
			};

			const appender2 = new IonicStorageAppender(config, storage);
			await appender2.initIonicStorageAppender();

			expect(appender2.getThreshold()).toBe(log4javascript.Level.INFO);
		});

		it("Set basic lvl threshold if value from configuration is invalid", async () => {

			const config: IonicStorageAppenderConfiguration = {
				ionicStorageKey: "MyLocalStorage4",
				threshold: "abc",
			};

			const appender = new IonicStorageAppender(config, storage);
			await appender.initIonicStorageAppender();

			expect(appender.getThreshold()).toEqual(log4javascript.Level.ALL);
		});
	});

	describe("append(loggingEvent: log4javascript.LoggingEvent): void", () => {

		it("writes message to messages array", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "WritesMessage" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, []);

			appender.append(event);

			const messages = appender.getLogMessages();
			expect(messages.length).toBe(1);
			expect(messages[0].timeStamp).toBe(event.timeStamp);
			expect(messages[0].level).toBe(event.level.toString());
		});

		it("writes message to end of messages array", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "WritesMessageEnd" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);
			const event2 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["2"]);

			appender.append(event);
			appender.append(event2);

			const messages = appender.getLogMessages();
			expect(messages.length).toBe(2);
			expect(messages[0].methodName).toBe("1");
			expect(messages[1].methodName).toBe("2");
		});

		it("removes first message if array contains already maxMessages messages", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "RemovesFirstMessage" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);
			const event2 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["2"]);
			const event3 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["3"]);

			appender.setMaxMessages(2);
			appender.append(event);
			appender.append(event2);
			appender.append(event3);

			const messages = appender.getLogMessages();
			expect(messages.length).toBe(2);
			expect(messages[0].methodName).toBe("2");
			expect(messages[1].methodName).toBe("3");
		});

		it("uses logger name from event if defined", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "UsesLogger" }, storage);
			await appender.initIonicStorageAppender();

			const logger = log4javascript.getLogger("MyLogger");
			const event = new log4javascript.LoggingEvent(logger, new Date(), log4javascript.Level.INFO, ["1"]);

			appender.append(event);

			const messages = appender.getLogMessages();
			expect(messages[0].logger).toBe("MyLogger");
		});

		it("uses undefined as logger name if not defined in event", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "UsesUndefined" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);

			appender.append(event);

			const messages = appender.getLogMessages();
			expect(messages[0].logger).toBeUndefined();
		});

		it("method not called if threshold is higher than log level", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "ThresholdIsHigher" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);

			appender.setThreshold(log4javascript.Level.WARN);
			appender.doAppend(event);

			let messages = appender.getLogMessages();
			expect(messages.length).toBe(0);

			const event2 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.WARN, ["1"]);
			appender.doAppend(event2);

			messages = appender.getLogMessages();
			expect(messages.length).toBe(1);
		});
	});

	describe("toString(): string", () => {

		it("returns logical type name", async () => {
			spyOn(storage, "get").and.returnValue(Promise.resolve(null));
			const appender = new IonicStorageAppender({ ionicStorageKey: "MyLocalStorage" }, storage);
			await appender.initIonicStorageAppender();

			const text = appender.toString();

			expect(text).toBe("Ionic.Logging.IonicStorageAppender");
		});
	});

	describe("getIonicStorageKey(): string", () => {

		it("return set value", async () => {
			spyOn(storage, "get").and.returnValue(Promise.resolve(null));
			const appender = new IonicStorageAppender({ ionicStorageKey: "MyLocalStorage" }, storage);
			await appender.initIonicStorageAppender();

			const localStorageKey = appender.getIonicStorageKey();

			expect(localStorageKey).toBe("MyLocalStorage");
		});
	});

	describe("getMaxMessages(): number", () => {

		it("return set value", async () => {
			spyOn(storage, "get").and.returnValue(Promise.resolve(null));
			const appender = new IonicStorageAppender({
				ionicStorageKey: "MyLocalStorage",
				maxMessages: 42
			}, storage);
			await appender.initIonicStorageAppender();
			const maxMessages = appender.getMaxMessages();

			expect(maxMessages).toBe(42);
		});
	});

	describe("setMaxMessages(value: number): void", () => {

		it("remove spare messages", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "RemoveSpare" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);
			const event2 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["2"]);
			const event3 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["3"]);

			appender.append(event);
			appender.append(event2);
			appender.append(event3);

			let messages = appender.getLogMessages();
			expect(messages.length).toBe(3);

			appender.setMaxMessages(1);

			messages = appender.getLogMessages();
			expect(messages.length).toBe(1);
			expect(messages[0].methodName).toBe("3");
		});

		it("same value does not change anything", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "SameValue" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);
			const event2 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["2"]);
			const event3 = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["3"]);

			appender.append(event);
			appender.append(event2);
			appender.append(event3);

			let messages = appender.getLogMessages();
			expect(messages.length).toBe(3);

			appender.setMaxMessages(250);

			messages = appender.getLogMessages();
			expect(messages.length).toBe(3);
			expect(appender.getMaxMessages()).toBe(250);
		});
	});

	describe("removeLogMessages(ionicStorageKey: string): void", () => {

		it("messages from localStorage removed", async () => {
			const appender = new IonicStorageAppender({ ionicStorageKey: "Removed" }, storage);
			await appender.initIonicStorageAppender();

			const event = new log4javascript.LoggingEvent(undefined, new Date(), log4javascript.Level.INFO, ["1"]);
			appender.append(event);
			await expect(await storage.get(appender.getIonicStorageKey())).toBeDefined();

			await IonicStorageAppender.removeLogMessages(appender.getIonicStorageKey());
			await expect(await storage.get(appender.getIonicStorageKey())).toBeNull();
		});
	});

});
