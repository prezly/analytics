declare interface Window {
    OnetrustActiveGroups?: string;
    OneTrust?: {
        ToggleInfoDisplay(): void;
        LoadBanner(): void;
        Close(): void;
        AllowAll(): void;
        RejectAll(): void;
    };
}
