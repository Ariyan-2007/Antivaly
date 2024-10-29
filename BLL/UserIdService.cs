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
    public class UserIdService
    {
        static UserIdService()
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



        public static void Increment(User user)
        {

            if (user.AccType == "Buyer")
            {
                var data = DataSupplier.UserIdDataAccess().Get(2);
                data.LastID = data.LastID + 1;
                DataSupplier.UserIdDataAccess().Edit(data);
            }
            else if (user.AccType == "Seller")
            {
                var data = DataSupplier.UserIdDataAccess().Get(3);
                data.LastID = data.LastID + 1;
                DataSupplier.UserIdDataAccess().Edit(data);
            }
            else if (user.AccType == "Delivery Man")
            {
                var data = DataSupplier.UserIdDataAccess().Get(4);
                data.LastID = data.LastID + 1;
                DataSupplier.UserIdDataAccess().Edit(data);
            }


        }


        public static List<UserIdModel> Get()
        {
            var data = Mapper.Map<List<UserIdModel>>(DataSupplier.UserIdDataAccess().Get());
            return data;
        }
        public static UserIdModel Get(int id)
        {
            var data = Mapper.Map<UserIdModel>(DataSupplier.UserIdDataAccess().Get(id));
            return data;
        }

    }
}
