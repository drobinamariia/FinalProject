from django.urls import path
from api.views import (
    CustomTokenObtainPairView, RegisterView, MyProfileView,

    ContextListCreate, ContextRetrieveDestroy, ArchivedContextListView,
    ArchivedContextDeleteView, CheckExpiredContextsView,

    ShareCodeCreate, RedeemCode, RedeemByContextIdView,

    ConsentRequestListView, ConsentRequestCreateView, ConsentRequestUpdateView,
    ConsentRequestByCodeView, CompanyPendingRequestsView,

    PersonalDetailsView, CompanyDetailsView,

    IndividualRedemptionsView, CompanyRedemptionsView, CompanyRedemptionDeleteView,
    RevokeAccessView,

    NotificationListView, NotificationUpdateView,

    UserSearchView, PublicProfileDetailView,
)

urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token"),
    path("contexts/", ContextListCreate.as_view()),
    path("contexts/archived/", ArchivedContextListView.as_view()),
    path("contexts/archived/<int:pk>/", ArchivedContextDeleteView.as_view()),
    path("sharecodes/", ShareCodeCreate.as_view()),
    path("codes/<str:code>/", RedeemCode.as_view()),
    path("register/", RegisterView.as_view()),
    path("profile/",   MyProfileView.as_view()), 
    path("contexts/<int:pk>/", ContextRetrieveDestroy.as_view()),
    path("redemptions/", IndividualRedemptionsView.as_view()),
    path("company-redemptions/", CompanyRedemptionsView.as_view()),
    path("company-redemptions/<int:pk>/", CompanyRedemptionDeleteView.as_view()),
    path("revoke-access/", RevokeAccessView.as_view()),
    path("consent-requests/", ConsentRequestListView.as_view()),
    path("consent-requests/create/", ConsentRequestCreateView.as_view()),
    path("consent-requests/<int:pk>/", ConsentRequestUpdateView.as_view()),
    path("consent-request-by-code/", ConsentRequestByCodeView.as_view()),
    path("notifications/", NotificationListView.as_view()),
    path("notifications/<int:pk>/", NotificationUpdateView.as_view()),
    path("company-pending-requests/", CompanyPendingRequestsView.as_view()),
    path("personal-details/", PersonalDetailsView.as_view()),
    path("company-details/", CompanyDetailsView.as_view()),
    path("search/users/", UserSearchView.as_view()),
    path("profile/public/<int:user_id>/", PublicProfileDetailView.as_view()),
    path("redeem-by-id/", RedeemByContextIdView.as_view()),
    path("check-expired-contexts/", CheckExpiredContextsView.as_view()),
]
