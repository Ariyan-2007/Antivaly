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
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
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
