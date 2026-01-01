#[cfg(test)]
mod tests {
    use crate::commands::subscriptions::{get_subscriptions, create_subscription, delete_subscription};
    use crate::commands::database::clear_test_db;
    use crate::models::Subscription;

    #[test]
    fn test_subscription_lifecycle() {
        // ... existing code ...
    }

    #[test]
    fn test_domain_lifecycle() {
        use crate::commands::domains::{get_domains, create_domain, delete_domain};
        use crate::models::Domain;

        clear_test_db().expect("Failed to clear test DB");

        let domain = Domain {
            id: None,
            name: "example.com".to_string(),
            registrar: Some("Namecheap".to_string()),
            cost: Some(12.99),
            currency: Some("USD".to_string()),
            registration_date: Some("2024-01-01".to_string()),
            expiry_date: "2025-01-01".to_string(),
            auto_renew: true,
            status: "active".to_string(),
            notes: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let id = create_domain(domain, true).expect("Failed to create domain");
        assert!(id > 0);

        let domains = get_domains(true).expect("Failed to get domains");
        assert_eq!(domains.len(), 1);
        assert_eq!(domains[0].name, "example.com");

        delete_domain(id, true).expect("Failed to delete domain");
        let domains_after = get_domains(true).expect("Failed to get domains");
        assert_eq!(domains_after.len(), 0);
    }

    #[test]
    fn test_pending_import_lifecycle() {
        use crate::commands::pending_imports::{get_pending_imports, create_pending_import, reject_pending_import};

        clear_test_db().expect("Failed to clear test DB");

        let id = create_pending_import(
            "Subject".to_string(),
            "from@example.com".to_string(),
            "2024-01-01".to_string(),
            "subscription".to_string(),
            "{}".to_string(),
            0.95,
            true
        ).expect("Failed to create pending import");
        assert!(id > 0);

        let imports = get_pending_imports(true).expect("Failed to get pending imports");
        assert_eq!(imports.len(), 1);
        assert_eq!(imports[0].email_subject, Some("Subject".to_string()));

        reject_pending_import(id, true).expect("Failed to reject pending import");
        let imports_after = get_pending_imports(true).expect("Failed to get pending imports");
        assert_eq!(imports_after.len(), 0);
    }
}
