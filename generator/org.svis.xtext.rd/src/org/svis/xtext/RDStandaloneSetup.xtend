/*
 * generated by Xtext 2.9.0.rc2
 */
package org.svis.xtext


/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
class RDStandaloneSetup extends RDStandaloneSetupGenerated {

	def static void doSetup() {
		new RDStandaloneSetup().createInjectorAndDoEMFRegistration()
	}
}