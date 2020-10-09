/**
 * Configuration for IonicStorageAppender.
 */
export interface IonicStorageAppenderConfiguration {
	/**
	 * Key which is used to store the messages in the ionic storage.
	 */
	ionicStorageKey: string;

	/**
	 * Maximum number of log messages stored by the appender.
	 *
	 * Default: 250.
	 */
	maxMessages?: number;

	/**
	 * Threshold.
	 *
	 * Valid values are: ALL, DEBUG, ERROR, FATAL, INFO, OFF, TRACE, WARN
	 *
	 * Default: WARN.
	 */
	threshold?: string;
}
