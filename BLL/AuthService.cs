using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class AuthService
    {
        static AuthService()
        {
            Mapper.Initialize(cfg => {
                cfg.CreateMap<Buyer, BuyerModel>();
                cfg.CreateMap<BuyerModel, Buyer>();
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
            });
        }
        public static TokenModel Auth(UserModel user)
        {
            var db_user = Mapper.Map<User>(user);
            var token = DataSupplier.AuthDataAccess().Authenticate(db_user);
            var tokenModel = Mapper.Map<TokenModel>(token);
            return tokenModel;
        }
        public static bool CheckValidityToken(string token)
        {
            var rs = DataSupplier.AuthDataAccess().IsAuthenticated(token);
            return rs;
        }

        public static bool Logout(string t)
        {
            return DataSupplier.AuthDataAccess().Logout(t);
        }
    }
}
