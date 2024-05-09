declare interface Window {
    OnetrustActiveGroups?: string;
    OneTrust?: {
        Init(): void;
        ToggleInfoDisplay(): void;
        LoadBanner(): void;
        Close(): void;
        AllowAll(): void;
        RejectAll(): void;
    };
}
