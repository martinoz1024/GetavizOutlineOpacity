/*
 * generated by Xtext 2.9.0.rc2
 */
package org.svis.xtext


/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
class CityStandaloneSetup extends CityStandaloneSetupGenerated {

	def static void doSetup() {
		new CityStandaloneSetup().createInjectorAndDoEMFRegistration()
	}
}