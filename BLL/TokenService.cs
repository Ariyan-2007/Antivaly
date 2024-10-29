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
    public class TokenService
    {
        static TokenService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
            });
        }

        public static void Create(TokenModel b)
        {
            var data = Mapper.Map<Token>(b);
            DataSupplier.TokenDataAccess().Add(data);
        }

        public static void Edit(TokenModel b)
        {
            var data = Mapper.Map<Token>(b);
            DataSupplier.TokenDataAccess().Edit(data);
        }

        public static void Delete(string id)
        {
            DataSupplier.TokenDataAccess().Delete(id);
        }

        public static List<TokenModel> Get()
        {
            var data = Mapper.Map<List<TokenModel>>(DataSupplier.TokenDataAccess().Get());
            return data;
        }
        public static TokenModel Get(string id)
        {
            var data = Mapper.Map<TokenModel>(DataSupplier.TokenDataAccess().Get(id));
            return data;
        }
    }
}
